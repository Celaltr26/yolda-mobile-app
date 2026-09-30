if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "C:/Users/cel_t/.gradle/caches/9.3.1/transforms/7b4da65a89c2e7d8063c4c4bb099cdf8/workspace/transformed/hermes-android-250829098.0.17-release/prefab/modules/hermesvm/libs/android.x86/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/cel_t/.gradle/caches/9.3.1/transforms/7b4da65a89c2e7d8063c4c4bb099cdf8/workspace/transformed/hermes-android-250829098.0.17-release/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

