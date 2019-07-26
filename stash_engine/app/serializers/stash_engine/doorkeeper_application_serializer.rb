module StashEngine
  class DoorkeeperApplicationSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id owner_id].freeze
    COLUMNS = (Doorkeeper::Application.column_names - REJECT_COLUMNS).freeze

  end
end