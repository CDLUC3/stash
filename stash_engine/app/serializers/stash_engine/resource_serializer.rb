module StashEngine
  class ResourceSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id user_id current_resource_state_id identifier_id current_editor_id]
    COLUMNS = (StashEngine::Resource.column_names - REJECT_COLUMNS).freeze

    def hash
      generic_hash.merge(
        user: UserSerializer.new(@my_model.user).hash,
        current_resource_state: ResourceStateSerializer.new(@my_model.current_resource_state).hash
      )
    end

  end
end