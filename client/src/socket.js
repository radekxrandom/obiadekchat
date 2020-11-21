import io from "socket.io-client";

export const socket = io.connect(process.env.REACT_APP_SOCKET_URL);

export const socket1 = io.connect(process.env.REACT_APP_SOCKET_ONE_URL);

export const socket2 = io.connect(process.env.REACT_APP_SOCKET_TWO_URL);
