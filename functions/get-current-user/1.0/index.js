const getCurrentUser = async ({ params }) => {
  return {
    result: JSON.stringify(params),
  };
};

export default getCurrentUser;
