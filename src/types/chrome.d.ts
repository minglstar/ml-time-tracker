declare namespace chrome {
  namespace runtime {
    interface LastError {
      message?: string;
    }

    interface MessageSender {
      id?: string;
      origin?: string;
      url?: string;
    }

    interface MessageOptions {
      includeTlsChannelId?: boolean;
    }

    function sendMessage<T = unknown, R = unknown>(
      extensionId: string | null | undefined,
      message: T,
      options: MessageOptions,
      responseCallback?: (response: R) => void
    ): Promise<R>;

    function sendMessage<T = unknown, R = unknown>(
      extensionId: string | null | undefined,
      message: T,
      responseCallback?: (response: R) => void
    ): Promise<R>;

    function sendMessage<T = unknown, R = unknown>(
      message: T,
      options: MessageOptions,
      responseCallback?: (response: R) => void
    ): Promise<R>;

    function sendMessage<T = unknown, R = unknown>(
      message: T,
      responseCallback?: (response: R) => void
    ): Promise<R>;

    const lastError: LastError | undefined;

    namespace onMessage {
      function addListener(
        callback: (
          message: unknown,
          sender: MessageSender,
          sendResponse: (response?: unknown) => void
        ) => void
      ): void;
    }
  }
}
