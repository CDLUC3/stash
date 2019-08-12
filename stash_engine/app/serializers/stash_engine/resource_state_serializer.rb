module StashEngine
  class ResourceStateSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id user_id resource_id].freeze
    COLUMNS = (StashEngine::ResourceState.column_names - REJECT_COLUMNS).freeze

    def hash
      super.merge(
        user: UserSerializer.new(@my_model.user).hash
      )
    end

  end
end
