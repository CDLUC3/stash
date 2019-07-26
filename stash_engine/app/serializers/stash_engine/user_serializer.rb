module StashEngine
  class UserSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id]
    COLUMNS = (StashEngine::User.column_names - REJECT_COLUMNS).freeze

    def hash
      generic_hash
    end

  end
end