import { Crypt } from "hybrid-crypto-js";
const entropy = process.env.REACT_APP_ENTROPY;
const crypt = new Crypt({ entropy: entropy });
export default crypt;
