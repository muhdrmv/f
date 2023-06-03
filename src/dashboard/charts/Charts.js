import React, {useEffect, useState} from 'react';
import {Column} from '@ant-design/charts';
import {gql, useQuery} from "@apollo/client";
import {changeTimeZone} from "../../utilities/Utils";

const GET_SESSIONS = gql`
query ($fromDate: timestamptz!) {
  sessions
    (
        order_by: {created_at: desc},
        where: {
            created_at: {_gte: $fromDate}
        }
    ) {
    id
    created_at
 
  }
}
`;

export const count = (array_elements) => {
    array_elements.sort();
    let editedArray = [];
    let current = null;
    let cnt = 0;
    for (let i = 0; i < array_elements.length; i++) {
        if (array_elements[i] !== current) {
            if (cnt > 0) {
                editedArray.push({Date: current, sessions: cnt})
            }
            current = array_elements[i];
            cnt = 1;
        } else {
            cnt++;
        }
    }

    if (cnt > 0) {
        editedArray.push({Date: current, sessions: cnt})
    }
    return editedArray;
}

const Charts = () => {
    const [de, setDe] = useState([]);
    const [query, ] = useState(GET_SESSIONS);
    const [queryVars, ] = useState({fromDate: (new Date(new Date().getTime() - 30*24*3600*1000).toUTCString()) });
    const {data} = useQuery(query, {variables: queryVars, notifyOnNetworkStatusChange: true});

    useEffect(() => {
        if (data) {
            const {sessions} = data;
            let newArray = [];
            sessions.forEach(session => {
                newArray.push(changeTimeZone(session.created_at,false))
            });
            let newData = count(newArray);
            setDe(newData.sort(function (a, b){
                return new Date(b.Date) - new Date(a.Date)
            }).reverse())
        }
    }, [data])

    let config = {
        data: de,
        xField: 'Date',
        yField: 'sessions',
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
            },
        },

    };
    return <Column {...config} />;
};

export default Charts;