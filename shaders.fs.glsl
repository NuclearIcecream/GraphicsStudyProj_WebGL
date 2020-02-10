#version 300 es

precision mediump float;

in vec2 fragTexCoord;

uniform sampler2D sampler;

void main() 
{
    gl_FragColor = texture2D(sampler, fragTexCoord);
}