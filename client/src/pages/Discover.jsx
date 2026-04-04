import { useState } from "react";
import { dummyConnectionsData } from "../assets/assets";

const Discover = () => {
  const [input, setInput] = useState([]);
  const [users, setUsers] = useState(dummyConnectionsData);
  const [loading, setLoading] = useState(false);

  return <div>Discover</div>;
};

export default Discover;
