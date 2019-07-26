module StashEngine
  class ResourceStateSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id user_id resource_id]
    COLUMNS = (StashEngine::ResourceState.column_names - REJECT_COLUMNS).freeze

    def hash
      generic_hash.merge(
        user: UserSerializer.new(@my_model.user).hash
      )
    end

  end
end