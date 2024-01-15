const vertexShader = /* glsl */`
uniform vec3 LightDirection1;
			uniform vec3 specularColor;
			//uniform vec3 diffuseColor;
			//uniform float roughnessValue; // 0 : smooth, 1: rough
			//uniform float F0; // fresnel reflectance at normal incidence
			uniform float k; // fraction of diffuse reflection (specular reflection = 1 - k)

			uniform sampler2D diffuseMap;
			uniform sampler2D roughnessMap;
			uniform sampler2D specularMap;
			uniform sampler2D normalMap;

			varying vec3 vnormal;
			varying vec3 vpos;
			varying vec2 vUv;	

			vec3 getNormal(vec3 normal, sampler2D normalMap,vec2 vUv){
				vec3 a = vec3(0.0, 0.0, 0.0);
				
				vec3 nu = vec3(a[1]*normal[2]-a[2]*normal[1], a[2]*normal[0]-a[0]*normal[2], a[0]*normal[1]-a[1]*normal[0]);
				mat3 nu_skew = mat3(0, -nu[2], nu[1], nu[2], 0, -nu[0], -nu[1], nu[0], 0);
				float c = a[0]*normal[0]+a[1]*normal[1]+a[2]*normal[2];

				mat3 R;				
				R[0][0] = (nu_skew[0][0]*nu_skew[0][0]+nu_skew[0][1]*nu_skew[1][0]+nu_skew[0][2]*nu_skew[2][0])/(1.0+c);
				R[0][1] = (nu_skew[0][0]*nu_skew[0][1]+nu_skew[0][1]*nu_skew[1][1]+nu_skew[0][2]*nu_skew[2][1])/(1.0+c);
				R[0][2] = (nu_skew[0][0]*nu_skew[0][2]+nu_skew[0][1]*nu_skew[1][2]+nu_skew[0][2]*nu_skew[2][2])/(1.0+c);

				R[1][0] = (nu_skew[1][0]*nu_skew[0][0]+nu_skew[1][1]*nu_skew[1][0]+nu_skew[1][2]*nu_skew[2][0])/(1.0+c);
				R[1][1] = (nu_skew[1][0]*nu_skew[0][1]+nu_skew[1][1]*nu_skew[1][1]+nu_skew[1][2]*nu_skew[2][1])/(1.0+c);
				R[1][2] = (nu_skew[1][0]*nu_skew[0][2]+nu_skew[1][1]*nu_skew[1][2]+nu_skew[1][2]*nu_skew[2][2])/(1.0+c);

				R[2][0] = (nu_skew[2][0]*nu_skew[0][0]+nu_skew[2][1]*nu_skew[1][0]+nu_skew[2][2]*nu_skew[2][0])/(1.0+c);
				R[2][1] = (nu_skew[2][0]*nu_skew[0][1]+nu_skew[2][1]*nu_skew[1][1]+nu_skew[2][2]*nu_skew[2][1])/(1.0+c);
				R[2][2] = (nu_skew[2][0]*nu_skew[0][2]+nu_skew[2][1]*nu_skew[1][2]+nu_skew[2][2]*nu_skew[2][2])/(1.0+c);
				
				R = mat3(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0) + nu_skew + R;

				a = texture2D(normalMap, vUv).rgb;					
				a = normalize(a);

				normal = vec3(R[0][0]*a[0]+R[0][1]*a[1]+R[0][2]*a[2], R[1][0]*a[0]+R[1][1]*a[1]+R[1][2]*a[2], R[2][0]*a[0]+R[2][1]*a[1]+R[2][2]*a[2]);
				normal = normalize(normal);

				return normal;
			}
						

			void main()
			{
				// vec3 lightDirection = normalize(LightDirection1-vpos); // to light
				vec3 lightDirection = normalize(LightDirection1);
				float r = length(LightDirection1-vpos);
			    vec3 normal = normalize(vnormal);

				float old_NdotL = dot(normal, lightDirection);

				normal = getNormal(normal, normalMap, vUv);
				
			    float NdotL = dot(normal, lightDirection);

				vec3 diffuseColor = texture2D(diffuseMap, vUv).rgb;
				
				// vec3 roughnessValue = vec3(0.01, 0.01, 0.01);
				vec3 roughnessValue = texture2D(roughnessMap, vUv).rgb;
				vec3 F0 = texture2D(specularMap, vUv).rgb;

				diffuseColor = diffuseColor * (1.0 - F0);
				diffuseColor = diffuseColor / 3.14159265358979323846264;
			    
			    vec3 specular = vec3(0.0, 0.0, 0.0);				
			    if(old_NdotL > 0.0)
			    {
					//normal = getNormal(normal, normalMap, vUv);

					//float NdotL = dot(normal, lightDirection);
					
			        vec3 eyeDir = normalize(-vpos); // to eye
			        vec3 halfVector = normalize(lightDirection + eyeDir);
			        float NdotH = max(dot(normal, halfVector), 0.0); 
			        float NdotV = max(dot(normal, eyeDir), 0.0);
			        float VdotH = max(dot(eyeDir, halfVector), 0.0);
			        vec3 mSquared = roughnessValue * roughnessValue;
			        
					vec3 alpha = NdotH * NdotH * (mSquared - 1.0) + 1.0;					
					vec3 D = mSquared / (alpha * alpha * 3.14159265358979323846264);
						
					alpha = (roughnessValue + 1.0) * (roughnessValue + 1.0) / 8.0;					
					vec3 G1 = NdotL / (NdotL * (1.0 - alpha) + alpha);
					vec3 G2 = NdotV / (NdotV * (1.0 - alpha) + alpha);
					vec3 G = G1 * G2;
			       
					vec3 F = F0 + (1.0 - F0) * pow(2.0, (-5.55473 * VdotH - 6.98316) * VdotH);
			       
					if(NdotL > 0.0 && NdotV > 0.0){
						specular = D * F * G / (4.0 * NdotL * NdotV);
					}
					
			    }
			    
				// vec3 finalValue = NdotL * (diffuseColor + specular) / lightDirection[2];				

				// vec3 finalValue = diffuseColor;
				vec3 finalValue = old_NdotL * (diffuseColor + specular) * 5.0;
				// vec3 finalValue = NdotL * 5.0;
				// 如果输入的贴图为null则给模型置为白色
				if (diffuseColor[0] == 0.0 && diffuseColor[1] == 0.0 && diffuseColor[2] == 0.0) {
					// finalValue = lightDirection;
					finalValue = vec3(1.0,1.0, 1.0);
				}
				//vec3 finalValue = normalize(specular);
			    gl_FragColor = vec4(finalValue, 1.0);
			}
`
const aaa = /* glsl */`
uniform vec3 LightDirection1;
			uniform vec3 specularColor;
			//uniform vec3 diffuseColor;
			//uniform float roughnessValue; // 0 : smooth, 1: rough
			//uniform float F0; // fresnel reflectance at normal incidence
			uniform float luminance; // fraction of diffuse reflection (specular reflection = 1 - k)

			uniform sampler2D diffuseMap;
			uniform sampler2D roughnessMap;
			uniform sampler2D specularMap;
			uniform sampler2D normalMap;

			varying vec3 vnormal;
			varying vec3 vpos;
			varying vec2 vUv;	

			vec3 getNormal(vec3 normal, sampler2D normalMap,vec2 vUv){
				vec3 a = vec3(0.0, 0.0, 1.0);
				
				vec3 nu = vec3(a[1]*normal[2]-a[2]*normal[1], a[2]*normal[0]-a[0]*normal[2], a[0]*normal[1]-a[1]*normal[0]);
				mat3 nu_skew = mat3(0, -nu[2], nu[1], nu[2], 0, -nu[0], -nu[1], nu[0], 0);
				float c = a[0]*normal[0]+a[1]*normal[1]+a[2]*normal[2];

				mat3 R;				
				R[0][0] = (nu_skew[0][0]*nu_skew[0][0]+nu_skew[0][1]*nu_skew[1][0]+nu_skew[0][2]*nu_skew[2][0])/(1.0+c);
				R[0][1] = (nu_skew[0][0]*nu_skew[0][1]+nu_skew[0][1]*nu_skew[1][1]+nu_skew[0][2]*nu_skew[2][1])/(1.0+c);
				R[0][2] = (nu_skew[0][0]*nu_skew[0][2]+nu_skew[0][1]*nu_skew[1][2]+nu_skew[0][2]*nu_skew[2][2])/(1.0+c);

				R[1][0] = (nu_skew[1][0]*nu_skew[0][0]+nu_skew[1][1]*nu_skew[1][0]+nu_skew[1][2]*nu_skew[2][0])/(1.0+c);
				R[1][1] = (nu_skew[1][0]*nu_skew[0][1]+nu_skew[1][1]*nu_skew[1][1]+nu_skew[1][2]*nu_skew[2][1])/(1.0+c);
				R[1][2] = (nu_skew[1][0]*nu_skew[0][2]+nu_skew[1][1]*nu_skew[1][2]+nu_skew[1][2]*nu_skew[2][2])/(1.0+c);

				R[2][0] = (nu_skew[2][0]*nu_skew[0][0]+nu_skew[2][1]*nu_skew[1][0]+nu_skew[2][2]*nu_skew[2][0])/(1.0+c);
				R[2][1] = (nu_skew[2][0]*nu_skew[0][1]+nu_skew[2][1]*nu_skew[1][1]+nu_skew[2][2]*nu_skew[2][1])/(1.0+c);
				R[2][2] = (nu_skew[2][0]*nu_skew[0][2]+nu_skew[2][1]*nu_skew[1][2]+nu_skew[2][2]*nu_skew[2][2])/(1.0+c);
				
				R = mat3(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0) + nu_skew + R;

				a = texture2D(normalMap, vUv).rgb;					
				a = normalize(a);		

				normal = vec3(R[0][0]*a[0]+R[0][1]*a[1]+R[0][2]*a[2], R[1][0]*a[0]+R[1][1]*a[1]+R[1][2]*a[2], R[2][0]*a[0]+R[2][1]*a[1]+R[2][2]*a[2]);
				normal = normalize(normal);

				return normal;
			}
						

			void main()
			{
				vec3 lightDirection = normalize(LightDirection1); // to light
				// vec3 lightDirection = normalize(LightDirection1-vpos); // to light
				//vec3 lightDirection = normalize(LightDirection1);
				float r = length(LightDirection1);
				// float r = length(LightDirection1-vpos);
			    vec3 normal = normalize(vnormal);

				float old_NdotL = dot(normal, lightDirection);

				normal = getNormal(normal, normalMap, vUv);
				
			    float NdotL = dot(normal, lightDirection);

				old_NdotL = NdotL;

				// vec3 diffuseColor = vec3(1.0,1.0,1.0);
				vec3 diffuseColor = texture2D(diffuseMap, vUv).rgb;
				// vec3 roughnessValue = vec3(0.1,0.1,0.1);
				vec3 roughnessValue = texture2D(roughnessMap, vUv).rgb;
				// vec3 F0 = vec3(0.0,0.0,0.0);
				vec3 F0 = texture2D(specularMap, vUv).rgb;

				diffuseColor = diffuseColor * (1.0 - F0);
				diffuseColor = diffuseColor / 3.14159265358979323846264;
			    
			    vec3 specular = vec3(0.0, 0.0, 0.0);				
			    if(old_NdotL > 0.0)
			    {
					//normal = getNormal(normal, normalMap, vUv);

					//float NdotL = dot(normal, lightDirection);
					
			        vec3 eyeDir = normalize(-vpos); // to eye
			        vec3 halfVector = normalize(lightDirection + eyeDir);
			        float NdotH = max(dot(normal, halfVector), 0.0); 
			        float NdotV = max(dot(normal, eyeDir), 0.0);
			        float VdotH = max(dot(eyeDir, halfVector), 0.0);
			        vec3 mSquared = roughnessValue * roughnessValue;
			        
					vec3 alpha = NdotH * NdotH * (mSquared - 1.0) + 1.0;					
					vec3 D = mSquared / (alpha * alpha * 3.14159265358979323846264);
						
					alpha = (roughnessValue + 1.0) * (roughnessValue + 1.0) / 8.0;					
					vec3 G1 = NdotL / (NdotL * (1.0 - alpha) + alpha);
					vec3 G2 = NdotV / (NdotV * (1.0 - alpha) + alpha);
					vec3 G = G1 * G2;
			       
					vec3 F = F0 + (1.0 - F0) * pow(2.0, (-5.55473 * VdotH - 6.98316) * VdotH);
			       
					if(NdotL > 0.0 && NdotV > 0.0){
						specular = D * F * G / (4.0 * NdotL * NdotV);
					}
					
			    }
			    
				//vec3 finalValue = NdotL * (diffuseColor + specular) / lightDirection[2];				

				//vec3 finalValue = old_NdotL * (diffuseColor + specular) / r * 50.0;

				vec3 finalValue = old_NdotL * (diffuseColor + specular) / r * float(luminance);
				// vec3 finalValue = old_NdotL * (diffuseColor + specular) / r * 60.0;

				//vec3 finalValue = 50.0 * specular;

			    gl_FragColor = vec4(finalValue, 1.0);
			}
`
export default aaa