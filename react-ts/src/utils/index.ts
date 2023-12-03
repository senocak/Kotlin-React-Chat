export const generateRandom = () => (1111 + Math.random() * 1_000).toFixed(0)
export const generateRandomColor = (): string => '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).slice(-6)
export const isImage = (file: File): boolean => file['type'].split('/')[0]==='image'
export const arraysEqualIgnoreOrder = <T>(arr1: T[], arr2: T[]): boolean => {
    const sortedArr1 = [...arr1].sort()
    const sortedArr2 = [...arr2].sort()
    return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2)
}
export const makeid = (length: number = 5) => {
    let result: string = ''
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength: number = characters.length
    let counter: number = 0
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
        counter += 1
    }
    return result
}