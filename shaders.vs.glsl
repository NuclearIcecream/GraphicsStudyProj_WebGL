#version 300 es

precision mediump float;

// Vertice position
layout (location = 0) in vec3 a_Position;
layout (location = 1) in vec2 a_TexCoord;
layout (location = 2) in vec3 a_Normal;

// matrix to hold transform data
//uniform mat4 transformMatrix;
uniform mat4 u_World;
uniform mat4 u_View;
uniform mat4 u_Projection;
uniform mat4 u_LightProjection;
uniform mat4 u_LightView;
vec3 u_OffsetPositions [] = vec3 [] (
    vec3 (253.0, 123.0, 193.0),
    vec3 (276.0, -97.0, -189.0),
    vec3 (-328.0, -87.0, 104.0),
    vec3 (199.0, 161.0, -239.0),
    vec3 (-313.0, -149.0, 147.0),
    vec3 (344.0, 200.0, -139.0),
    vec3 (-172.0, -215.0, -333.0),
    vec3 (159.0, 13.0, -145.0),
    vec3 (234.0, -311.0, 22.0),
    vec3 (-91.0, 99.0, -153.0),
    vec3 (319.0, -157.0, 94.0),
    vec3 (33.0, 151.0, -143.0),
    vec3 (259.0, -92.0, -35.0),
    vec3 (119.0, -182.0, -56.0),
    vec3 (-339.0, 28.0, 315.0),
    vec3 (-305.0, 25.0, 263.0),
    vec3 (-276.0, 350.0, -136.0),
    vec3 (289.0, 86.0, 258.0),
    vec3 (-428.0, -232.0, 66.0),
    vec3 (149.0, -269.0, 242.0),
    vec3 (92.0, 233.0, 210.0),
    vec3 (11.0, -135.0, -413.0),
    vec3 (135.0, 74.0, -75.0),
    vec3 (279.0, 85.0, 19.0),
    vec3 (-152.0, 232.0, -66.0)
);

// varying for the color
out vec3 v_FragPosition;
out vec2 fragTexCoord;
out vec3 v_Normal;
out vec4 v_FragPosLightSpace;
out vec3 v_OffsetPositions [25];

void main()
{
    gl_Position = u_Projection * u_View * u_World * vec4(a_Position, 1.0);

    // pass values to fragmentShader
    v_FragPosition = vec3 (u_World * vec4(a_Position, 1.0));
    v_Normal = transpose (inverse (mat3 (u_World))) * a_Normal;
    fragTexCoord = a_TexCoord;
    mat4 lightSpace = u_LightProjection * u_LightView;
    v_FragPosLightSpace =  lightSpace * vec4 (v_FragPosition, 1.0);
    v_OffsetPositions = u_OffsetPositions;
}