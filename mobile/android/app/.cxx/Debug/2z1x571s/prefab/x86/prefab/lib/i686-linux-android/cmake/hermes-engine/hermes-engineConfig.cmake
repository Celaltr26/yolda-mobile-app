if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "C:/Users/cel_t/.gradle/caches/9.3.1/transforms/6ccfe4faa4ca441ff93548274d117fa9/workspace/transformed/hermes-android-250829098.0.17-debug/prefab/modules/hermesvm/libs/android.x86/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/cel_t/.gradle/caches/9.3.1/transforms/6ccfe4faa4ca441ff93548274d117fa9/workspace/transformed/hermes-android-250829098.0.17-debug/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

