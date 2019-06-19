export const wait = async (delay: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(true), delay)
  })
}