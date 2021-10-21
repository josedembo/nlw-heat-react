import styles from "./styles.module.scss";
import logoImg from "../../assets/logo.svg";
import { api } from "../../services/api"
import { useEffect, useState } from "react";
import io from "socket.io-client"

type Messages = {
    id: string
    text: string
    user: {
        name: string
        avatar_url: string
    }
}

let messagesQueue: Messages[] = [];

const socket = io("http://localhost:4000");

socket.on("new_message", (newMessage: Messages) => {
    messagesQueue.push(newMessage);
})

export function MessageList() {
    const [messages, setMessages] = useState<Messages[]>([]);


    useEffect(() => {

        const timer = setInterval(() => {
            if (messagesQueue.length > 0) {
                setMessages(preveState => [
                    messagesQueue[0],
                    preveState[0],
                    preveState[1]
                ].filter(Boolean))

                messagesQueue.shift();
            }
        }, 3000);

    }, []);

    useEffect(() => {
        api.get<Messages[]>("messages/lest3").then((response => {
            setMessages(response.data)
        }));
    }, [])

    return (
        <div className={styles.messageListWrapper}>
            <img src={logoImg} alt="DoWhile 2021" />

            <ul className={styles.messageList}>

                {messages.map(message => {
                    return (
                        <li key={message.id} className={styles.message}>
                            <p className={styles.messageContent}>{message.text}</p>
                            <div className={styles.messageUser}>
                                <div className={styles.imageUser}>
                                    <img src={message.user.avatar_url} alt={message.user.name} />
                                </div>
                                <span>{message.user.name}</span>
                            </div>
                        </li>
                    )
                })}

            </ul>
        </div>
    )
}