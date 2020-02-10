#version 300 es

precision mediump float;

in vec2 fragTexCoord;

uniform sampler2D sampler;

out vec4 outColor;

void main() 
{
    outColor = texture(sampler, fragTexCoord);
}