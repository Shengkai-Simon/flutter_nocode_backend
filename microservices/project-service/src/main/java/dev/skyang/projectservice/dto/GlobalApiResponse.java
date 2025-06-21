package dev.skyang.projectservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Generic, standardized API response encapsulation.
 * Use @JsonInclude(JsonInclude.Include.NON_NULL) to ensure that null fields are not included in the JSON output.
 *
 * @param <T> The type of data payload.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GlobalApiResponse<T> {

    private int code;
    private String message;
    private T data;

    public GlobalApiResponse(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    /**
     * Create a successful response with data.
     */
    public static <T> GlobalApiResponse<T> success(T data) {
        return new GlobalApiResponse<>(200, "Success", data);
    }

    /**
     * Create a successful response with only a message.
     */
    public static <T> GlobalApiResponse<T> success(String message) {
        return new GlobalApiResponse<>(200, message, null);
    }

    /**
     * Create an error response.
     */
    public static <T> GlobalApiResponse<T> error(int code, String message) {
        return new GlobalApiResponse<>(code, message, null);
    }


    // Getters and Setters
    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
