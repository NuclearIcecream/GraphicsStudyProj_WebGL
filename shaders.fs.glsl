#version 300 es

precision mediump float;

in vec2 fragTexCoord;
in vec3 v_Normal;

uniform vec3 ambientLightIntensity;
uniform vec3 lightSourceIntensity;
uniform vec3 lightSourceDirection;
uniform sampler2D diffuseSampler;

out vec4 outColor;

void main() 
{
    vec3 surfNormal = normalize(v_Normal);
    vec3 normSourceDir = normalize(lightSourceDirection);
    vec4 texel = texture(diffuseSampler, fragTexCoord);

    vec3 lightIntensity = ambientLightIntensity + lightSourceIntensity *
    max(dot(surfNormal, normSourceDir), 0.0);
    vec4 renderColors = vec4(texel.rgb * lightIntensity, texel.a);

    outColor = renderColors;
}