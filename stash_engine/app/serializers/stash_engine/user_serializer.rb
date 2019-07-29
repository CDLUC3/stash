module StashEngine
  class UserSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id].freeze
    COLUMNS = (StashEngine::User.column_names - REJECT_COLUMNS).freeze

    def hash
      super.merge(doorkeeper_applications: Doorkeeper::Application.where(owner_id: @my_model.id))
    end

  end
end
