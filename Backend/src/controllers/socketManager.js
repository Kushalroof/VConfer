import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("Something connected");

        socket.on("join-call", (path) => {
            if (connections[path] === undefined) {
                connections[path] = [];
            }
            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();

            const existingUsers = connections[path].filter(id => id !== socket.id);
            io.to(socket.id).emit("user-joined", socket.id, existingUsers);

            for (let i = 0; i < existingUsers.length; i++) {
                io.to(existingUsers[i]).emit("user-joined", socket.id, [socket.id]);
            }

            if (messages[path] !== undefined) {
                for (let i = 0; i < messages[path].length; ++i) {
                    io.to(socket.id).emit(
                        "chat-message",
                        messages[path][i]["data"],
                        messages[path][i]["sender"],
                        messages[path][i]["socket-id-sender"]
                    );
                }
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([matchingRoom, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [matchingRoom, isFound];
                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }
                messages[matchingRoom].push({
                    'sender': sender,
                    "data": data,
                    "socket-id-sender": socket.id
                });
                console.log("message", matchingRoom, ":", sender, data);
                connections[matchingRoom].forEach(elem => {
                    io.to(elem).emit("chat-message", data, sender, socket.id);
                });
            }
        });

        socket.on("disconnect", () => {
            var diffTime = Math.abs(timeOnline[socket.id] - new Date());
            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        for (let b = 0; b < connections[k].length; ++b) {
                            io.to(connections[k][b]).emit("user-left", socket.id);
                        }

                        var index = connections[k].indexOf(socket.id);
                        connections[k].splice(index, 1);

                        if (connections[k].length === 0) {
                            delete connections[k];
                        }
                    }
                }
            }
        });
    });

    return io;
};