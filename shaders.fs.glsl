#version 300 es

precision mediump float;

in vec3 v_FragPosition;
in vec2 fragTexCoord;
in vec3 v_Normal;
in vec4 v_FragPosLightSpace;

uniform vec3 viewPosition;
uniform vec3 ambientLightIntensity;
uniform vec3 lightSourceIntensity;
uniform vec3 lightSourceDirection;
uniform sampler2D diffuseSampler;
uniform sampler2D shadowMap;

out vec4 outColor;

void main() 
{
    vec3 color = texture(diffuseSampler, fragTexCoord).rgb;
    vec3 surfNormal = normalize(v_Normal);
    vec3 lightColor = vec3(5.0);

    // ambient component
    vec3 ambient = color * 0.15;

    // diffuse component
    vec3 lightDir = normalize(lightSourceDirection - v_FragPosition);
    float diff = max (dot (lightDir, surfNormal), 0.0);
    vec3 diffuse = diff * lightColor * 0.5;

    // specular component
    vec3 viewDir = normalize (viewPosition - v_FragPosition);
    float spec = 0.0;
    vec3 halfwayDir = normalize (lightDir + viewDir);
    spec = pow (max (dot (surfNormal, halfwayDir), 0.0), 64.0);
    vec3 specular = spec * lightColor;

    // calc shadows
    // perspec divides
    vec3 projCoords = v_FragPosLightSpace.xyz / v_FragPosLightSpace.w;
    // transform to 0,1 range
    projCoords = projCoords * 0.5 + 0.5;
    // get depth from light perspec
    float closeDepthLight = texture (shadowMap, projCoords.xy).r;
    // get depth from current fragment
    float closeDepthFrag = projCoords.z;
    // Bias value
    float bias = max(0.05 * (1.0 - dot(surfNormal, lightDir)), 0.005);
    // check if current frag in shadow
    float shadow = closeDepthFrag -bias > closeDepthLight ? 1.0 : 0.0;

    vec3 lighting = (ambient + (1.0 - shadow) * (diffuse + specular)) * color;
    outColor = vec4 (lighting, 1.0);
}