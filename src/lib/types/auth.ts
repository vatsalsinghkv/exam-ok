export type AuthResponseType<T> =
  | {
      status: "failed";
      error: string;
    }
  | {
      status: "success";
      success: string;
      data: T;
    };
