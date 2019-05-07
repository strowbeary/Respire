extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

#[no_mangle]
pub fn say_hi() -> String{
    return "Hi world".into();
}
