
import * as PIXI from "pixi.js";
const Filter = PIXI.Filter;

export function createFishEye(app) {
    let filter;
    let vertSrc = `
#ifdef GL_ES
precision highp float;
#endif

uniform mat3 projectionMatrix;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
varying vec2 vTextureCoord;

void main(void){
	vTextureCoord = aTextureCoord;
	gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
}
`;

    let fragSrc = `
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;

uniform vec4 filterArea;
uniform vec2 dimensions;

varying vec2 vTextureCoord;

void main(void){
  float a = 1.0;
  float b = 1.0;
  float F = 1.0;
  float scale = 1.5;
  vec4 uLens = vec4(a, b, F, scale);
  vec2 uFov = vec2(1.0, 1.0);
  
  vec2 normalizedCoord = vTextureCoord * filterArea.xy / dimensions.xy;
  vec2 centerCoord = normalizedCoord * 2.0 - 1.0; // @popelyshev: maybe *2 - 1.0 but its even worse

	float L = length(vec3(centerCoord.xy/scale, F));
	vec2 vMapping = centerCoord.xy * F / L;
	vMapping = vMapping * uLens.xy;
  
  vec2 displacedNormalizedCoord = (vMapping + 1.0) / 2.0;
  vec2 displacedTextureCoord = displacedNormalizedCoord * dimensions.xy / filterArea.xy;

	vec4 texture = texture2D(uSampler, displacedTextureCoord);
	
	if(displacedNormalizedCoord.x > 0.99 || displacedNormalizedCoord.x < 0.01 
  || displacedNormalizedCoord.y > 0.99 || displacedNormalizedCoord.y < 0.01){
		texture = vec4(0.0, 0.0, 0.0, 1.0);
	} 
	
	gl_FragColor = texture;
}
`;
    let uniforms = {dimensions: new Float32Array([1, 1])};
    filter = new Filter(vertSrc, fragSrc);
    filter.apply = function (filterManager, input, output, clear) {
        this.uniforms.dimensions[0] = input.sourceFrame.width;
        this.uniforms.dimensions[1] = input.sourceFrame.height;

        filterManager.applyFilter(this, input, output, clear);
    };
    app.stage.filterArea = app.renderer.screen;
    return filter;
}
