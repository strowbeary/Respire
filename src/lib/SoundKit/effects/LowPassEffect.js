export function LowPassEffect(audio_context) {
    const filter_node = audio_context.createBiquadFilter();
    filter_node.type = "lowpass";
    filter_node.frequency.value = 20000;
    return {
        filter_node,
        set_frequency(f) {
            console.log(f);
            filter_node.frequency.value = f;
        }
    };
}
