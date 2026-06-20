export function addModal() {
  const modal = add([
    rect(width(), height()),
    color(0, 0, 0),
    opacity(0.5),
    fixed(),
  ])

  return modal
}
