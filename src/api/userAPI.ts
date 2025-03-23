export const getUserData = async (userId: string): Promise<User> => {
  try {
    const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const saveUserData = async (userData: any): Promise<any> => {
  try {
    const response = await fetch("http://localhost:5000/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save user data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};
