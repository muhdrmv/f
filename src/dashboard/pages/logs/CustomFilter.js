import React, {useEffect, useState} from "react";
import {Grid} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import JalaliDatePicker from "../../../utilities/JalaliDatePicker";

const CustomFilter = ({setWhere}) => {

    const [filter, setFilter] = useState({search: '', dateFrom: null, dateTo: null});

    useEffect(() => {
        const where = {};

        if (!filter.search && !filter.dateFrom && !filter.dateTo) {
            setWhere(null)
            return;
        }

        if (filter.search)
            where._or = [
                {meta: {_contains: {reason: filter.search}}},
                {meta: {_contains: {username: filter.search}}},
                {meta: {_contains: {entity_id: filter.search}}},
                {meta: {_contains: {by_username: filter.search}}},
                {meta: {_contains: {to_connection_name: filter.search}}},
                {meta: {_contains: {user_ip_address: filter.search}}},
                {service: {_ilike: '%' + filter.search + '%'}},
                {type:    {_ilike: '%' + filter.search + '%'}},
            ];
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

    const handleChangeFilterSearch = (e) => {
        setFilter(s => ({...s, search: e?.target.value}));
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

                <Grid item xs={6}>
                    <TextField label="Search" variant="outlined" fullWidth margin="normal"
                               value={filter.search} onChange={handleChangeFilterSearch}/>
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