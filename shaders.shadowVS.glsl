#version 300 es
layout (location = 0) in vec4 a_position;

uniform mat4 u_LightProjection;
uniform mat4 u_LightView;
uniform mat4 u_World;

void main() {
  gl_Position = u_LightProjection * u_LightView * u_World * a_position;
}