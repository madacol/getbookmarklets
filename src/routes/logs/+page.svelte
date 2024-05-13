<script>
    const { data } = $props();

    const {logs} = data;
</script>

<main>
    <table class="box">
        <thead>
            <tr>
                <th title="response time in milliseconds">ms</th>
                <th>Path</th>
                <th>Username</th>
                <th>Created At</th>
                <th>Method</th>
                <th>Status</th>
                <th>Referer</th>
                <th>City</th>
                <th>Timezone</th>
                <th>Country</th>
                <th>IP</th>
                <th>User Agent</th>
                <th>Headers</th>
                <th>User Session</th>
                <th>Params</th>
                <th>Body</th>
            </tr>
        </thead>
        <tbody>
            {#each logs as {path, username, created_at, method, status, referer, city, timezone, country, ip, user_agent, headers, user_session, params, body, response_time}}
                {@const json_headers = JSON.stringify(headers, null, 2)}
                {@const json_user_session = JSON.stringify(user_session, null, 2)}
                {@const json_params = JSON.stringify(params, null, 2)}
                {@const json_body = JSON.stringify(body, null, 2)}
                <tr>
                    <td title={response_time}>{response_time}</td>
                    <td title={path}>{path}</td>
                    <td title={username}>{username}</td>
                    <td title={created_at}>{created_at}</td>
                    <td title={method}>{method}</td>
                    <td title={status}>{status}</td>
                    <td title={referer}>{referer}</td>
                    <td title={city}>{city}</td>
                    <td title={timezone}>{timezone}</td>
                    <td title={country}>{country}</td>
                    <td title={ip}>{ip}</td>
                    <td title={user_agent}>{user_agent}</td>
                    <td title={json_headers}>{json_headers}</td>
                    <td title={json_user_session}>{json_user_session}</td>
                    <td title={json_params}>{json_params}</td>
                    <td title={json_body}>{json_body}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 2rem;
        overflow: auto;
        margin: auto;
    }
    tbody td {
        border-top: 1px solid #adadad;
    }
    td, th {
        padding: 0.5rem;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
