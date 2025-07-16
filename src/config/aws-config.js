import { Amplify } from "aws-amplify";

const awsConfig = {
  Auth: {
    Cognito: {
      region: import.meta.env.VITE_COGNITO_REGION || "ap-south-1",
      userPoolId: import.meta.env.VITE_USER_POOL_ID || "",
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || "",
      loginWith: {
        email: true,
      },
    },
  },
};

Amplify.configure(awsConfig);

export default awsConfig;
