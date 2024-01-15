const vertexShader = /* glsl */`
varying vec3 LightDir[2];
			varying vec3 vnormal;
			varying vec3 vpos;

			varying vec2 vUv;
		
			void main()
			{
				vUv = uv*1.0;				
				
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

			    // vertex normal
				vnormal = normalize(normalMatrix * normal);

				// vertex position
				vpos = vec3(modelViewMatrix * vec4(position, 1.0));
			}
`;
export default vertexShader