#version 300 es

precision mediump float;

in vec3 fragPosition;
in vec2 fragTexCoord;
in vec3 v_Normal;

uniform vec3 viewPosition;
uniform vec3 ambientLightIntensity;
uniform vec3 lightSourceIntensity;
uniform vec3 lightSourceDirection;
uniform sampler2D diffuseSampler;

out vec4 outColor;

void main() 
{
    vec3 color = texture(diffuseSampler, fragTexCoord).rgb;
    vec3 surfNormal = normalize(v_Normal);
    vec3 lightColor = vec3(5.0);

    // ambient component
    vec3 ambient = color * 0.15;

    // diffuse component
    vec3 lightDir = normalize(lightSourceDirection - fragPosition);
    float diff = max (dot (lightDir, surfNormal), 0.0);
    vec3 diffuse = diff * lightColor;

    // specular component
    vec3 viewDir = normalize (viewPosition - fragPosition);
    float spec = 0.0;
    vec3 halfwayDir = normalize (lightDir + viewDir);
    spec = pow (max (dot (surfNormal, halfwayDir), 0.0), 64.0);
    vec3 specular = spec * lightColor;
 
    vec3 lighting = (ambient * (diffuse + specular)) * color;
    outColor = vec4 (lighting, 1.0);
}