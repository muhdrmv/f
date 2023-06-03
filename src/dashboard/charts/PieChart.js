import React, {useEffect, useState} from 'react';
import {Pie} from '@ant-design/charts';
import {gql, useQuery} from "@apollo/client";
import {count} from "./Charts";

const GET_CONNECTIONS = gql`
query Query {
  connections
    (order_by: {created_at: desc}) {
    id
    name
    protocol
    hostname
  }
}
`;


const PieChart= () => {
    const [queryVars, ] = useState({});
    const [de, setDe] = useState([]);
    const {data:dataConnection} = useQuery(GET_CONNECTIONS, {variables: queryVars, notifyOnNetworkStatusChange: true});

    useEffect(()=>{
        if (dataConnection) {
            const {connections} = dataConnection;
            let newArray = [];
            connections.forEach(connection => {
                newArray.push(connection.protocol)
            })
            let newData = count(newArray);
            setDe(newData)
        }
    },[dataConnection])

    let config = {
        appendPadding: 10,
        data: de,
        angleField: 'sessions',
        colorField: 'Date',
        radius: 0.9,
        label: {
            type: 'inner',
            offset: '-30%',
            content: function content(_ref) {
                let percent = _ref.percent;
                return ''.concat((percent * 100).toFixed(0), '%');
            },
            style: {
                fontSize: 14,
                textAlign: 'center',
            },
        },
        interactions: [{ type: 'element-active' }],
    };
    return <Pie {...config} />;
};

export default PieChart;