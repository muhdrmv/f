import React from 'react';
import './App.css';
import App from './App';
import {ApolloClient, ApolloLink, from, HttpLink, InMemoryCache} from '@apollo/client'; // devtest
import {ApolloProvider} from '@apollo/client/react';
import {onError} from '@apollo/client/link/error';

function ApolloApp() {
    const appRef = React.useRef();
    const httpLink = new HttpLink({ uri: process.env.REACT_APP_DATA_SERVICE_URL });

    const errorLink = onError( e => {
        if (e.graphQLErrors ) {
            // if session expired go to sign-in page and return after successful sign-in 
            const errorMessage = e?.graphQLErrors?.[0]?.message ?? '';
            if (e.operation === 'ACTION_AUTH_SIGN_IN') return; // prevent infinite loop
            if (!errorMessage.includes(`not found in type: 'query_root'`) &&
                !errorMessage.includes(`not found in type: 'mutation_root'`)) return;
            console.log('gql sign-out suspicious error: ', e)
            // appRef.current.recheckAuth();
        }
    });

    const authMiddleware = new ApolloLink((operation, forward) => {
        operation.setContext((ctx) => {
            const token = window.localStorage.getItem('AuthToken');
            if (token) {
                return {
                    headers: {
                        ...ctx.headers,
                        authorization: `Bearer ${token}`
                    }
                }
            }
        });
        return forward(operation);
    })
    
    const client = new ApolloClient({
        cache: new InMemoryCache(),
        link: from([errorLink, authMiddleware, httpLink]),
        defaultOptions: {
            query: {
                fetchPolicy: 'no-cache'
            },
            watchQuery: {
                fetchPolicy: 'no-cache'
            }
        }
    });
    
    return (
        <ApolloProvider client={client}>
            <App ref={appRef} />
        </ApolloProvider>
    );
}

export default ApolloApp;
    