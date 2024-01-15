precision mediump float;
uniform vec2 u_resolution;
varying vec3 LightDir[2];
// varying vec3 vnormal;
varying vec3 vpos;
varying vec2 vUv;
uniform float u_time;

float circle(vec2 uv, vec2 center, float  d) {
    return length(uv - center) - d;
}
float cloud(vec2 uv, vec2 center, float d) {
    float step = 1.2;
    float c1 = circle(uv, vec2(center.x - d * 0.9 * 1.0 * step, center.y), d * 0.9);
    float c2 = circle(uv, vec2(center.x - d * 0.8 * 2.0 * step, center.y), d * 0.8);
    float c3 = circle(uv, vec2(center.x, center.y), d);
    float c4 = circle(uv, vec2(center.x + d * 0.9 * 1.0 * step, center.y), d * 0.9);
    float c5 = circle(uv, vec2(center.x + d * 0.8 * 2.0 * step, center.y), d * 0.8);
    return min(c5, min(c4, min(c3, min(c1, c2))));
}
void main () {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv.x += u_time * 0.3;
    uv.x = fract(uv.x);
    float d = cloud(uv, vec2(0.5, 0.5), 0.05);
    // if (d <= 0.0) {
    //     d = 0.0;
    // } else {
    //     d = 1.0;
    // }
    d = 1.0 - step(0.0, d);
    vec3 color = vec3(d);
    gl_FragColor = vec4(color, 1.0);
}