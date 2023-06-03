
import {gql, useMutation} from '@apollo/client';


const SET_FRONT_LOG = gql`
mutation ($service: String!, $type: String!, $meta: json!) {
    action_front_logs(service: $service, type: $type, meta:$meta) {
        successed
    }
}
`;
const useFrontLogs = () => {
     const [setFrontLogs] = useMutation(SET_FRONT_LOG);
   
     const frontLogs = async (type, reason, newData, oldData, user_id, username) => {

          let service = 'data';
          let meta = {
               "data": {
                    "new": newData,
                    "old": oldData
               },
               "user_id": user_id,
               "username": username,
               "table_name": "logs",
               "reason": reason
          };
   
          console.log(type, reason, newData, oldData, user_id, username);
   
          try {
               let mutationResult = await setFrontLogs({
                    variables: {
                         type,
                         service,
                         meta
                    }
               });
          } catch (e) {
               console.log(e);
          }
     };
   
     return frontLogs;
};
   
export default useFrontLogs;