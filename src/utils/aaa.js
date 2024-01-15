import {
	Vector2
} from 'three';

/**
 * NVIDIA FXAA by Timothy Lottes
 * https://developer.download.nvidia.com/assets/gamedev/files/sdk/11/FXAA_WhitePaper.pdf
 * - WebGL port by @supereggbert
 * http://www.glge.org/demos/fxaa/
 * Further improved by Daniel Sturk
 */

const FXAAShader = {

	name: 'FXAAShader',

	uniforms: {

		'tDiffuse': { value: null },
		'resolution': { value: new Vector2( 1 / 1024, 1 / 512 ) }

	},

	vertexShader: /* glsl */`

  #define saturate(a) clamp( a, 0.0, 1.0 )

  uniform sampler2D tDiffuse;

  uniform float exposure;

  varying vec2 vUv;

  vec3 RRTAndODTFit( vec3 v ) {

    vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
    vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
    return a / b;

  }

  vec3 ACESFilmicToneMapping( vec3 color ) {

  // sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
    const mat3 ACESInputMat = mat3(
      vec3( 0.59719, 0.07600, 0.02840 ), // transposed from source
      vec3( 0.35458, 0.90834, 0.13383 ),
      vec3( 0.04823, 0.01566, 0.83777 )
    );

  // ODT_SAT => XYZ => D60_2_D65 => sRGB
    const mat3 ACESOutputMat = mat3(
      vec3(  1.60475, -0.10208, -0.00327 ), // transposed from source
      vec3( -0.53108,  1.10813, -0.07276 ),
      vec3( -0.07367, -0.00605,  1.07602 )
    );

    color = ACESInputMat * color;

  // Apply RRT and ODT
    color = RRTAndODTFit( color );

    color = ACESOutputMat * color;

  // Clamp to [0, 1]
    return saturate( color );

  }

  void main() {

    vec4 tex = texture2D( tDiffuse, vUv );

    tex.rgb *= exposure / 0.6; // pre-exposed, outside of the tone mapping function

    gl_FragColor = vec4( ACESFilmicToneMapping( tex.rgb ), tex.a );

  }`

};

export { FXAAShader };