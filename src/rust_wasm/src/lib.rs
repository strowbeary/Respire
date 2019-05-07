extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;
extern crate js_sys;
use js_sys::ImageData;

#[wasm_bindgen]
pub fn update() -> ImageData {
    let frame = ImageData::new_with_sw(300, 300).unwrap();
    return frame
}
