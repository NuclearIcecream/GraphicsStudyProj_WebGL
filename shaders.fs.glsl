#version 300 es

precision mediump float;

in vec2 fragTexCoord;
in vec3 v_Normal;

uniform sampler2D sampler;

out vec4 outColor;

void main() 
{
    vec3 normal = normalize(v_Normal);
    vec3 ambientLightIntensity = vec3 (0.1, 0.1, 0.2);
    vec3 lightSourceIntensity = vec3(0.9, 0.9, 0.9);
    vec3 lightSourceDirection = normalize(vec3(20.0, 10.0, 0.0));

    vec4 texel = texture(sampler, fragTexCoord);

    vec3 lightIntensity = ambientLightIntensity + lightSourceIntensity *
    max(dot(normal, lightSourceDirection), 0.0);

    outColor = vec4(texel.rgb * lightIntensity, texel.a);
}