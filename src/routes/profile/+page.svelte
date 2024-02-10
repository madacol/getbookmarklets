<script>
    import SecondaryLinkButton from '$lib/components/SecondaryLinkButton.svelte'
    import Location from '$lib/components/Location.svelte'
    import Name from '$lib/components/Name.svelte'
    import PrimaryButton from '$lib/components/PrimaryButton.svelte'
    import ProfileImageEdit from '$lib/components/ProfileImageEdit.svelte'
    import TextArea from '$lib/components/TextArea.svelte'
    import Input from '$lib/components/Input.svelte'
    import Select from '$lib/components/Select.svelte'
    import MainContainer from '$lib/components/MainContainer.svelte'

    export let data
    let {
        name,
        lastname,
        email,
        gender,
        birthday,
        bio,
        image_data_url,
        is_verified
    } = data.user

    function validateData(event) {
        if (!image_data_url || !bio) {
            alert("Please fill in all fields")
            event.preventDefault()
        }
    }

</script>

<MainContainer back_button={true}>
    <form method="post" on:submit={validateData}>

        <ProfileImageEdit bind:src={image_data_url} />
        <Name name={`${name} ${lastname}`} is_verified={is_verified} />
        <Location />
        <Input
            value={birthday}
            label="Birthday"
            type="date"
            name="birthday"
        />

        <Select
            options={[
                {value: "male", label: "Male"},
                {value: "female", label: "Female"},
                {value: "non-binary", label: "Non-binary"},
                {value: "other", label: "Other"},
            ]}
            bind:selected={gender}
            name="gender"
        />

        <TextArea name="bio" placeholder="User Bio" bind:value={bio} />

        <div class="actions">
            <SecondaryLinkButton on:click={validateData} href="/">Search Pals</SecondaryLinkButton>
            <PrimaryButton type="submit">Update</PrimaryButton>
        </div>
    </form>
</MainContainer>


<style>
    form {
        display: flex;
        flex-direction: column;
        gap: 1em;
        align-self: stretch;
    }
    .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        min-width: 70%;
        flex-direction: row;
        justify-content: center;
        align-items: stretch;
        gap: 1em;
        margin-top: 1rem;
    }
</style>
