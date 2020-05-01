#version 300 es

precision mediump float;

in vec3 v_FragPosition;
in vec2 fragTexCoord;
in vec3 v_Normal;
in vec4 v_FragPosLightSpace;
in vec3 v_OffsetPositions [25];

uniform vec3 viewPosition;
uniform vec3 ambientLightIntensity;
uniform vec3 lightSourceIntensity;
uniform vec3 lightSourceDirection;
uniform sampler2D diffuseSampler;
uniform sampler2D shadowMap;
uniform sampler2D cameraDepthSampler;

out vec4 outColor;

float AmbientOcclusionRatio ()
{
    // offsetPositions located in v_OffsetPositions
    // fragment offset is v_Normal
    // get other needed vars
    float offsetsAboveNormal = 0.0;
    float visibleOffsets = 0.0;

    // get the points above the surface of the geometry
    for (int i = 0; i < 50; i++) // for every single offset point
    {
        float result = dot(v_OffsetPositions[i], normalize(v_Normal));
        if (result > 0.0)    // multiply by normal
            offsetsAboveNormal++;                   // and count which have sum >0
    }

    // determine which offset points are actually visible with the cameraDepthTexture
    for (int i = 0; i < 50; i++) // for every single offset point
    {
        // create the offsetPoint
        vec3 cameraProjCoord = v_FragPosition;
        cameraProjCoord.x = cameraProjCoord.x + v_OffsetPositions[i].x;
        cameraProjCoord.y = cameraProjCoord.y + v_OffsetPositions[i].y;
        cameraProjCoord.z = cameraProjCoord.z + v_OffsetPositions[i].z;

        // adjust it to pixelSpace
        cameraProjCoord = cameraProjCoord * 0.5 + 0.5;

        // check if the point is valid
        bool inRange =
            cameraProjCoord.x >= 0.0 &&
            cameraProjCoord.x <= 1.0 &&
            cameraProjCoord.y >= 0.0 &&
            cameraProjCoord.y <= 1.0;

        if (inRange)    // If the point is valid...
        {
            // look up the point in the texture
            float cameraDistToGeometry = texture(cameraDepthSampler, cameraProjCoord.xy).r;
            
            // get the offsetPoint depth
            float depthOfPoint = cameraProjCoord.z;

            // check if the offset is nearer to the camera than the texture z value
            if (depthOfPoint < cameraDistToGeometry)    // if the offset point is nearer than the geometry...
            {
                visibleOffsets++;   // increment the counter
            }
        }
    }

    // then return the float value of truly visible over the maybe visible
    return visibleOffsets/offsetsAboveNormal;
}

void main() 
{
    vec3 color = texture(diffuseSampler, fragTexCoord).rgb;
    vec3 surfNormal = normalize(v_Normal);
    vec3 lightColor = vec3(5.0);

    // ambient component
    //vec3 ambient = color  * 0.15;
    vec3 ambient = color * AmbientOcclusionRatio();

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

    bool inRange =
        projCoords.x >= 0.0 &&
        projCoords.x <= 1.0 &&
        projCoords.y >= 0.0 &&
        projCoords.y <= 1.0;

    // get depth from light perspec
    float closeDepthLight = texture (shadowMap, projCoords.xy).r;
    // get depth from current fragment
    float closeDepthFrag = projCoords.z;
    // Bias value
    float bias = max(0.05 * (1.0 - dot(surfNormal, lightDir)), 0.005);
    // check if current frag in shadow
    float shadow = closeDepthLight >= closeDepthFrag - bias ? 0.0 : 1.0;

    if (inRange != true)
    {
        shadow = 0.0;
    }
    vec3 lighting = (ambient + (1.0 - shadow) * (diffuse + specular)) * color;
    outColor = vec4 (lighting, 1.0);
}