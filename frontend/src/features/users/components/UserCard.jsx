const UserCard = ({ user }) => {
  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
      <h3>{user.username}</h3>
      <p>Email: {user.email}</p>
      <p>Status: {user.is_active ? "Active" : "Inactive"}</p>
    </div>
  );
};

export default UserCard;
