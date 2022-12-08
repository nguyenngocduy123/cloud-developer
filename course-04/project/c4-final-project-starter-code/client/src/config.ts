// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'd0mburrewl'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-hm0fzlge8sksqlhc.us.auth0.com',            // Auth0 domain
  clientId: '534PmamBe3HkXR5sqQTuyyCIyDE49rgO',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}