import { redirect } from '@sveltejs/kit';

export function load({ url }) {
    const new_script_url = url.pathname.replace('/scripts/', '/scripts#');

    redirect(301 ,new_script_url);
}
