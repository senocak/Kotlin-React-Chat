import IStorage from "./IStorage";
import LocalStorage from "./LocalStorage";

const AppStorage: IStorage = LocalStorage.getInstance()

export default AppStorage