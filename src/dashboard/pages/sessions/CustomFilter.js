import React, {useEffect, useState} from "react";
import {Grid} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import JalaliDatePicker from "../../../utilities/JalaliDatePicker";

const CustomFilter = ({setWhere}) => {

    const [filter, setFilter] = useState({username: '', connectionName: '', dateFrom: null, dateTo: null});

    useEffect(() => {
        if (!filter.username && !filter.connectionName && !filter.dateFrom && !filter.dateTo) {
            setWhere(null)
            return;
        }

        const where = {};
        
        if (filter.username){

            let user = {_or: []}
            let username = filter.username.split(",")
            where.user = {}

            username.map( i => {
                i= i.trim()
                if(i.length > 0){ // This means that it does not show all usernames after (,)
                    let k = {username: {_ilike: `%${i}%`}}
                    user._or.push(k)
                    where.user = user    
                }
            })
        }
        if (filter.connectionName){
            let connections = {_or: []};
            let connectionName = filter.connectionName.split(",");
            where.connection = {}

            connectionName.map( i => {
                i= i.trim()
                if(i.length > 0){ // This means that it does not show all usernames after (,)
                    let k = {name: {_ilike: `%${i}%`}}
                    connections._or.push(k)
                    where.connection = connections    
                }
            })
        }
        if (filter.dateTo)
            where.created_at = {
                ...where.created_at ?? {},
                _lte: filter.dateTo
            }
        if (filter.dateFrom)
            where.created_at = {
                ...where.created_at ?? {},
                _gte: filter.dateFrom
            }

        setWhere(where);
    }, [filter])

    const handleChangeFilterUsername = (e) => {
        setFilter(s => ({...s, username: e?.target.value}));
    }

    const handleChangeFilterConnectionName = (e) => {
        setFilter(s => ({...s, connectionName: e?.target.value}));
    }

    const handleChangeFilterDateFrom = (v) => {
        setFilter(s => ({...s, dateFrom: v?.startOf('day') || null}));
    }

    const handleChangeFilterDateTo = (v) => {
        setFilter(s => ({...s, dateTo: v?.endOf('day') || null}));
    }

    return (

        <div>
            <Grid container spacing={1} style={{margin: '1%', width: '98%'}}>

                <Grid item xs={3}>
                    <TextField label="Username" variant="outlined" fullWidth margin="normal"
                               value={filter.username} onChange={handleChangeFilterUsername}/>
                </Grid>

                <Grid item xs={3}>
                    <TextField label="Connection" variant="outlined" fullWidth margin="normal"
                               value={filter.connectionName} onChange={handleChangeFilterConnectionName}/>
                </Grid>

                <Grid item xs={3}>
                    <JalaliDatePicker onChange={handleChangeFilterDateFrom} label="From date" value={filter.dateFrom}/>
                </Grid>

                <Grid item xs={3}>
                    <JalaliDatePicker onChange={handleChangeFilterDateTo} label="To date" value={filter.dateTo}/>
                </Grid>

            </Grid>
        </div>
    )
}

export default CustomFilter;