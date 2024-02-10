// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: UserInfo;
		}
		// interface Notification {
		// 	id: number;
		// 	type: string;
		// 	title: string;
		// 	message: string;
		// 	created_at: Date;
		// 	read_at: Date;
		// }
		interface UserInfo {
			user_id: number;
			name: string;
			lastname: string;
			email: string;
			expired: Date;
			is_verified: boolean;
			verification_status: string;
			roles: number[];
			permissions: string[];
			notifications: any[];
			image_data_url: string;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
