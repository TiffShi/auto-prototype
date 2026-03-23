import React, { useState } from 'react';

const Profile = ({ user, onUpdateProfile }) => {
  const [name, setName] = useState(user.name);
  const [goal, setGoal] = useState(user.goal);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile({ name, goal });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Profile</h2>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
      <input type="number" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Daily Goal (ml)" required />
      <button type="submit">Update Profile</button>
    </form>
  );
};

export default Profile;