struct VSOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex 
fn vs(@builtin(vertex_index) vertexIndex: u32) -> VSOut {
  let pos = array(
    vec2f(-1, -1),
    vec2f( 3, -1),
    vec2f(-1,  3),
  );
  return VSOut(
    vec4f(pos[vertexIndex], 0, 1),
    pos[vertexIndex] * 0.5 + 0.5,
  );
}