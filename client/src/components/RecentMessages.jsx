import { useEffect, useState } from "react";
import { dummyRecentMessagesData } from "../assets/assets";
import { Link } from "react-router-dom";
import moment from "moment";
import { useAuth, useUser } from "@clerk/react";
import api from "../api/axios";
import toast from "react-hot-toast";

const RecentMessages = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [messages, setMessages] = useState([]);

  const fetchRecentMessages = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/user/recent-messages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        // group messages by sender and get latest message
        const groupedMessages = data.messages.reduce((acc, msg) => {
          const senderId = msg.from_user_id._id;
          if (
            !acc[senderId] ||
            new Date(msg.createdAt) > new Date(acc[senderId].createdAt)
          ) {
            acc[senderId] = msg;
          }
          return acc;
        }, {});

        // sort messages by date
        const sortedMessages = Object.values(groupedMessages).sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setMessages(sortedMessages);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecentMessages();
      setInterval(fetchRecentMessages, 30000);
      return () => {
        clearInterval();
      };
    }
  }, [user]);

  return (
    <div
      className="bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow 
                    text-xs text-slate-800"
    >
      <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>
      <div className="flex flex-col max-w-56 overflow-y-scroll no-scrollbar">
        {messages.map((msg, idx) => (
          <Link
            to={`/messages/${msg.from_user_id._id}`}
            key={idx}
            className="flex items-start gap-2 py-2 hover:bg-slate-100"
          >
            <img
              src={msg.from_user_id.profile_picture}
              className="w-8 h-8 rounded-full"
            />
            <div className="w-full">
              <div className="flex justify-between">
                <p className="font-medium">{msg.from_user_id.full_name}</p>
                <p className="text-[10px] text-slate-400">
                  {moment(msg.createdAt).fromNow()}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">{msg.text ? msg.text : "Media"}</p>
                {!msg.seen && (
                  <p
                    className="bg-indigo-500 text-white w-4 h-4 flex items-center 
                                justify-center rounded-full text-[10px]"
                  >
                    1
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentMessages;
